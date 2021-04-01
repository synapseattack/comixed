/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.comic;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicService</code> provides business rules for instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicService {
  @Autowired private ComicRepository comicRepository;
  @Autowired private LastReadService lastReadService;
  @Autowired private UserService userService;

  /**
   * Retrieves a single comic by id. Sets user-specific values for the provider user.
   *
   * @param id the comic record id
   * @param email the user's email address
   * @return the comic
   * @throws ComicException if the comic is not found
   */
  public Comic getComic(final long id, final String email) throws ComicException {
    ComiXedUser user = null;
    try {
      user = this.userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new ComicException("No such user: " + email, error);
    }

    Comic result = this.getComic(id);
    log.debug("Loading last read date for comic: user id={}", user.getId());
    result.setLastRead(this.lastReadService.getLastReadForComicAndUser(result, user));

    return result;
  }

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicException if the comic does not exist
   */
  public Comic getComic(final long id) throws ComicException {
    log.debug("Getting comic: id={}", id);

    final Optional<Comic> comicRecord = this.comicRepository.findById(id);

    if (!comicRecord.isPresent()) {
      throw new ComicException("no such comic: id=" + id);
    }

    final Comic result = comicRecord.get();
    final List<Comic> next =
        this.comicRepository.findIssuesAfterComic(
            result.getSeries(), result.getVolume(), result.getIssueNumber(), result.getCoverDate());
    if (!next.isEmpty()) {
      int index = 0;
      Comic nextComic = null;
      while (nextComic == null && index < next.size()) {
        Comic candidate = next.get(index);
        if (candidate.getCoverDate().compareTo(result.getCoverDate()) > 0) {
          log.debug("Found next issue by cover date: id={}", candidate.getId());
          nextComic = candidate;
        } else if ((candidate.getCoverDate().compareTo(result.getCoverDate()) == 0)
            && (candidate.getSortableIssueNumber().compareTo(result.getSortableIssueNumber())
                > 0)) {
          log.debug("Found next issue by issue number: id={}", candidate.getId());
          nextComic = candidate;
        } else {
          index++;
        }
      }
      if (nextComic != null) {
        log.debug("Setting the next comic: id={}", nextComic.getId());
        result.setNextIssueId(nextComic.getId());
      }
    }
    final List<Comic> prev =
        this.comicRepository.findIssuesBeforeComic(
            result.getSeries(), result.getVolume(), result.getIssueNumber(), result.getCoverDate());
    if (!prev.isEmpty()) {
      int index = prev.size() - 1;
      Comic prevComic = null;
      while (prevComic == null && index >= 0) {
        Comic candidate = prev.get(index);
        if (candidate.getCoverDate().compareTo(result.getCoverDate()) < 0) {
          log.debug("Found previous issue by cover date: id={}", candidate.getId());
          prevComic = candidate;
        } else if ((candidate.getCoverDate().compareTo(result.getCoverDate()) == 0)
            && (candidate.getSortableIssueNumber().compareTo(result.getSortableIssueNumber())
                < 0)) {
          log.debug("Found previous issue by issue number: id={}", candidate.getId());
          prevComic = candidate;
        } else {
          index--;
        }
      }
      if (prevComic != null) {
        log.debug("Setting previous comic: id={}", prevComic.getId());
        result.setPreviousIssueId(prevComic.getId());
      }
    }

    log.debug("Returning comic: id={}", result.getId());
    return result;
  }

  /**
   * Marks a comic for deletion but does not actually delete the comic.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public Comic deleteComic(final long id) throws ComicException {
    log.debug("Marking comic for deletion: id={}", id);

    final Optional<Comic> record = this.comicRepository.findById(id);

    if (!record.isPresent()) {
      throw new ComicException("no such comic: id=" + id);
    }

    final Comic comic = record.get();
    log.debug("Setting deleted date");
    comic.setDateDeleted(new Date());

    log.debug("Updating comic in the database");
    comic.setDateLastUpdated(new Date());
    return this.comicRepository.save(comic);
  }

  /**
   * Updates a comic record.
   *
   * @param id the comic id
   * @param update the updated comic data
   * @return the updated comic
   */
  @Transactional
  public Comic updateComic(final long id, final Comic update) {
    log.debug("Updating comic: id={}", id);

    final Optional<Comic> record = this.comicRepository.findById(id);

    if (record.isPresent()) {
      final Comic comic = record.get();
      log.debug("Updating the comic fields");

      comic.setPublisher(update.getPublisher());
      comic.setImprint(update.getImprint());
      comic.setSeries(update.getSeries());
      comic.setVolume(update.getVolume());
      comic.setIssueNumber(update.getIssueNumber());
      comic.setSortName(update.getSortName());
      comic.setScanType(update.getScanType());
      comic.setFormat(update.getFormat());
      comic.setDateLastUpdated(new Date());

      log.debug("Saving updated comic");
      return this.comicRepository.save(comic);
    }

    log.debug("No such comic");
    return null;
  }

  /**
   * Saves a new comic.
   *
   * @param comic the comic
   * @return the saved comic
   */
  @Transactional
  public Comic save(final Comic comic) {
    log.debug("Saving comic: filename={}", comic.getFilename());

    comic.setDateLastUpdated(new Date());

    final Comic result = this.comicRepository.save(comic);

    this.comicRepository.flush();

    return result;
  }

  /**
   * Retrieves the full content of the comic file.
   *
   * @param comic the comic
   * @return the comic content
   */
  @Transactional
  public byte[] getComicContent(final Comic comic) {
    log.debug("Getting file content: filename={}", comic.getFilename());

    try {
      return FileUtils.readFileToByteArray(new File(comic.getFilename()));
    } catch (IOException error) {
      log.error("Failed to read comic file content", error);
      return null;
    }
  }

  /**
   * Unmarks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public Comic restoreComic(final long id) throws ComicException {
    log.debug("Restoring comic: id={}", id);

    final Optional<Comic> record = this.comicRepository.findById(id);

    if (!record.isPresent()) {
      throw new ComicException("no such comic: id=" + id);
    }

    final Comic comic = record.get();

    log.debug("Restoring comic: id={} originally deleted={}", id, comic.getDateDeleted());

    log.debug("Clearing deleted date");
    comic.setDateDeleted(null);
    log.debug("Refreshing last updated date");
    comic.setDateLastUpdated(new Date());

    log.debug("Saving comic");
    return this.comicRepository.save(comic);
  }

  /**
   * Marks a comic as read by the given user.
   *
   * @param email the user's email
   * @param id the comic id
   * @return the last read date
   * @throws ComicException if the comic id is invalid
   * @throws ComiXedUserException if the email is invalid
   */
  @Transactional
  public LastReadDate markAsRead(String email, long id)
      throws ComicException, ComiXedUserException {
    log.debug("Marking comic as read by {}: id={}", email, id);
    Comic comic = this.comicRepository.getById(id);
    if (comic == null) throw new ComicException("no such comic: id=" + id);

    ComiXedUser user = this.userService.findByEmail(email);

    return this.lastReadService.markComicAsRead(comic, user);
  }

  /**
   * Marks a comic as unread by the given user.
   *
   * @param email the user's email
   * @param id the comic id
   * @throws ComicException if the comic is invalid
   * @throws ComiXedUserException if the email is invalid
   */
  @Transactional
  public void markAsUnread(String email, long id) throws ComicException, ComiXedUserException {
    log.debug("Marking comic as not read by {}: id={}", email, id);
    Comic comic = this.comicRepository.getById(id);
    if (comic == null) throw new ComicException("no such comic: id=" + id);

    ComiXedUser user = this.userService.findByEmail(email);

    this.lastReadService.markComicAsUnread(comic, user);
  }

  /**
   * Deletes the specified comic from the library.
   *
   * @param comic the comic
   */
  @Transactional
  public void delete(final Comic comic) {
    log.debug("Deleting comic: id={}", comic.getId());
    this.comicRepository.delete(comic);
  }

  /**
   * Retrieves a page of comics to be moved.
   *
   * @param page the page
   * @param max the maximum number of comics to return
   * @return the list of comics
   */
  public List<Comic> findComicsToMove(final int page, final int max) {
    return this.comicRepository.findComicsToMove(PageRequest.of(page, max));
  }

  /**
   * Returns a comic with the given absolute filename.
   *
   * @param filename the filename
   * @return the comic
   */
  public Comic findByFilename(final String filename) {
    return this.comicRepository.findByFilename(filename);
  }

  /**
   * Returns all comics with the given page hash
   *
   * @param hash the page hash
   */
  @Transactional
  public void updateComicsWithPageHash(final String hash) {
    log.debug("Loading comics with page hash: {}", hash);
    final List<Comic> comics = this.comicRepository.findComicsForPageHash(hash);
    if (comics.isEmpty()) {
      log.debug("No comics found");
      return;
    }

    log.debug(
        "Updating last read date for {} comic{}", comics.size(), comics.size() == 1 ? "" : "s");
    for (int index = 0; index < comics.size(); index++) {
      final Comic comic = comics.get(index);
      comic.setDateLastUpdated(new Date());
      this.comicRepository.save(comic);
    }
  }

  /**
   * Returns a list of comics, including the last read date, for a given user.
   *
   * @param email the user's email
   * @param lastId the last id loaded
   * @param maximum the maximum number to return
   * @throws ComiXedUserException if the email is invalid
   * @return the list of comics
   */
  public List<Comic> getComicsById(final String email, final Long lastId, final Integer maximum)
      throws ComiXedUserException {
    log.debug("Loading {} comics for {} with id > {}", email, maximum, lastId);
    final ComiXedUser user = this.userService.findByEmail(email);
    final List<Comic> result = this.getComicsById(lastId, maximum);
    log.debug(
        "Loading last read date for {} comic{}", result.size(), result.size() == 1 ? "" : "s");
    result.forEach(
        comic -> {
          log.trace("Loading last read date: id={} user={}", comic.getId(), email);
          comic.setLastRead(this.lastReadService.getLastReadForComicAndUser(comic, user));
        });
    log.trace("Returning comics");
    return result;
  }

  /**
   * Returns a list of comics with ids greater than the threshold specified.
   *
   * @param threshold the id threshold
   * @param max the maximum number of records
   * @return the list of comics
   */
  public List<Comic> getComicsById(final long threshold, final int max) {
    log.debug("Finding {} comic{} with id greater than {}", max, max == 1 ? "" : "s", threshold);
    return this.comicRepository.findComicsWithIdGreaterThan(threshold, PageRequest.of(0, max));
  }
}
