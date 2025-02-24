/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.library;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_USER;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishLastReadRemovedAction;
import org.comixedproject.messaging.library.PublishLastReadUpdatedAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.LastReadRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateChangeListener;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>LastReadService</code> provides rules for marking instances of {@link ComicBook} as read by
 * {@link ComiXedUser}s.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class LastReadService implements InitializingBean, ComicStateChangeListener {
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private UserService userService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private LastReadRepository lastReadRepository;
  @Autowired private PublishLastReadUpdatedAction publishLastReadUpdatedAction;
  @Autowired private PublishLastReadRemovedAction publishLastReadRemovedAction;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to comic state change events");
    this.comicStateHandler.addListener(this);
  }

  /**
   * Modifies the last read state for a comic when a related event occurs.
   *
   * @param state the new state
   * @param message the event message
   */
  @Override
  @Transactional
  public void onComicStateChange(
      final State<ComicState, ComicEvent> state, final Message<ComicEvent> message) {
    log.trace("Fetching comicBook");
    final ComicBook comicBook = message.getHeaders().get(HEADER_COMIC, ComicBook.class);
    log.trace("Fetching event type");
    final ComicEvent event = message.getPayload();
    if (event == ComicEvent.markAsRead) {
      log.trace("Fetching user");
      final ComiXedUser user = message.getHeaders().get(HEADER_USER, ComiXedUser.class);
      log.trace("Marking comicBook as read");
      this.markComicAsRead(comicBook, user);
    }
    if (event == ComicEvent.markAsUnread) {
      log.trace("Fetching user");
      final ComiXedUser user = message.getHeaders().get(HEADER_USER, ComiXedUser.class);
      log.trace("Marking comicBook as read");
      this.markComicAsUnread(comicBook, user);
    }
  }

  /**
   * Creates a record marking the specified comicBook as read by the given user.
   *
   * @param comicBook the comicBook
   * @param user the user
   */
  public void markComicAsRead(final ComicBook comicBook, final ComiXedUser user) {
    log.trace("Creating last read record");
    final LastRead lastRead =
        this.lastReadRepository.save(new LastRead(comicBook.getComicDetail(), user));
    try {
      this.publishLastReadUpdatedAction.publish(lastRead);
    } catch (PublishingException error) {
      log.error("Failed to publish last read update", error);
    }
  }

  public void markComicAsUnread(final ComicBook comicBook, final ComiXedUser user) {
    log.trace("Loading last read record");
    final LastRead lastRead =
        this.lastReadRepository.loadEntryForComicAndUser(comicBook.getComicDetail(), user);
    log.trace("Deleting last read record");
    this.lastReadRepository.delete(lastRead);
    try {
      this.publishLastReadRemovedAction.publish(lastRead);
    } catch (PublishingException error) {
      log.error("Failed to publish last read removed", error);
    }
  }

  /**
   * Gets a batch of last read dates for the given user. The records returned will come after the
   * specified threshold id, and will contain no more than the maximum specified entries.
   *
   * @param email the user's email address
   * @param threshold the id threshold
   * @param maximum the maximum records to return
   * @return the entries
   * @throws LastReadException if an error occurs
   */
  public List<LastRead> getLastReadEntries(
      final String email, final long threshold, final int maximum) throws LastReadException {
    log.debug("Loading user: {}", email);
    ComiXedUser user = this.doFindUser(email);
    log.debug("Loading {} last read entries for {} with id > {}", maximum, email, threshold);
    return this.lastReadRepository.loadEntriesForUser(user, threshold, PageRequest.of(0, maximum));
  }

  private ComiXedUser doFindUser(final String email) throws LastReadException {
    try {
      return this.userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new LastReadException("Failed to load last read entries for user", error);
    }
  }

  /**
   * Sets the read state for a set of comics for a given user.
   *
   * @param email the user's email
   * @param ids the set of comic ids
   * @param state the read state
   * @throws LastReadException if the user was not found
   */
  public void setLastReadState(final String email, final List<Long> ids, final boolean state)
      throws LastReadException {
    for (int index = 0; index < ids.size(); index++) {
      final Long id = ids.get(index);
      this.doSetLastReadState(email, id, state);
    }
  }

  /**
   * Sets the read state for a single comic for a given user.
   *
   * @param email the user's email
   * @param id the comic id
   * @param state the read state
   * @throws LastReadException if the user was not found
   */
  public void setLastReadState(final String email, final Long id, final boolean state)
      throws LastReadException {
    this.doSetLastReadState(email, id, state);
  }

  public void doSetLastReadState(final String email, final Long id, final boolean state)
      throws LastReadException {
    try {
      log.debug("Loading the user: {}", email);
      final ComiXedUser user = this.doFindUser(email);
      log.trace("Loading comicBook: id={}", id);
      final ComicBook comicBook = this.comicBookService.getComic(id);
      log.trace("Creating additional headers");
      Map<String, Object> headers = new HashMap<>();
      headers.put(HEADER_USER, user);
      if (state) {
        log.trace("Firing event: mark comicBook as read");
        this.comicStateHandler.fireEvent(comicBook, ComicEvent.markAsRead, headers);
      } else {
        log.trace("Firing event: mark comicBook as unread");
        this.comicStateHandler.fireEvent(comicBook, ComicEvent.markAsUnread, headers);
      }
    } catch (ComicBookException error) {
      log.error("Failed to process comic last read state", error);
    }
  }
}
