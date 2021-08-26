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

package org.comixedproject.controller.lists;

import com.fasterxml.jackson.annotation.JsonView;
import java.security.Principal;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.net.AddComicsToReadingListRequest;
import org.comixedproject.model.net.AddComicsToReadingListResponse;
import org.comixedproject.model.net.RemoveComicsFromReadingListRequest;
import org.comixedproject.model.net.library.RemoveComicsFromReadingListResponse;
import org.comixedproject.model.net.lists.SaveReadingListRequest;
import org.comixedproject.model.net.lists.UpdateReadingListRequest;
import org.comixedproject.repositories.library.ReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ReadingListController</code> provides REST APIs for working with instances of {@link
 * ReadingList}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ReadingListController {
  @Autowired ReadingListRepository readingListRepository;
  @Autowired ReadingListService readingListService;

  /**
   * Retrieves all reading lists for the current user.
   *
   * @param principal the user principal
   * @return the reading lists
   * @throws ReadingListException if the email address is invalid
   */
  @GetMapping(value = "/api/lists/reading", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingLists.class)
  @PreAuthorize("hasRole('READER')")
  @AuditableEndpoint
  public List<ReadingList> getReadingListsForUser(Principal principal) throws ReadingListException {
    final String email = principal.getName();
    log.info("Getting reading lists: user={}", email);
    return this.readingListService.getReadingListsForUser(email);
  }

  /**
   * Creates a new reading list for the current user.
   *
   * @param principal the user principal
   * @param request the request body
   * @return the new reading list
   * @throws ReadingListException if the list name is already used
   */
  @PostMapping(
      value = "/api/lists/reading",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingListDetail.class)
  @PreAuthorize("hasRole('READER')")
  @AuditableEndpoint
  public ReadingList createReadingList(
      Principal principal, @RequestBody() SaveReadingListRequest request)
      throws ReadingListException {
    final String email = principal.getName();
    final String name = request.getName();
    final String summary = request.getSummary();

    log.info("Creating reading list for user: email={} name={}", email, name);

    return this.readingListService.createReadingList(email, name, summary);
  }

  /**
   * Updates an existing reading list for the current user.
   *
   * @param principal the user principal
   * @param id the reading list id
   * @param request the request body
   * @return the updated reading list
   * @throws ReadingListException if the reading list does not exist
   */
  @PutMapping(
      value = "/api/lists/reading/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingListDetail.class)
  @PreAuthorize("hasRole('READER')")
  @AuditableEndpoint
  public ReadingList updateReadingList(
      Principal principal,
      @PathVariable("id") long id,
      @RequestBody() UpdateReadingListRequest request)
      throws ReadingListException, ComicException {
    final String email = principal.getName();
    final String name = request.getName();
    final String summary = request.getSummary();

    log.info(
        "Updating reading list for user: email={} id={} name={} summary={}",
        email,
        id,
        name,
        summary);

    return this.readingListService.updateReadingList(email, id, name, summary);
  }

  /**
   * Retrieves a single reading list for the current user
   *
   * @param principal the user principal
   * @param id the reading list id
   * @return the reading list
   * @throws ReadingListException if the id is invalid or not owned by the current user
   */
  @GetMapping(value = "/api/lists/reading/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ReadingListDetail.class)
  @PreAuthorize("hasRole('READER')")
  @AuditableEndpoint
  public ReadingList getReadingList(final Principal principal, @PathVariable("id") final long id)
      throws ReadingListException {
    final String email = principal.getName();
    log.info("Getting reading list for user: email={} id={}", email, id);
    return this.readingListService.getReadingListForUser(email, id);
  }

  @PostMapping(
      value = "/api/lists/reading/{id}/comics/add",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public AddComicsToReadingListResponse addComicsToList(
      Principal principal,
      @PathVariable("id") Long id,
      @RequestBody() AddComicsToReadingListRequest request)
      throws ReadingListException {
    String email = principal.getName();
    List<Long> comicIds = request.getIds();

    log.info(
        "Adding {} comic{} to the reading list for {}: id={}",
        comicIds.size(),
        comicIds.size() == 1 ? "" : "s",
        email,
        id);

    int count = this.readingListService.addComicsToList(email, id, comicIds);

    return new AddComicsToReadingListResponse(count);
  }

  @PostMapping(
      value = "/api/lists/reading/{id}/comics/remove",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public RemoveComicsFromReadingListResponse removeComicsFromList(
      Principal principal,
      @PathVariable("id") long id,
      @RequestBody() RemoveComicsFromReadingListRequest request)
      throws ReadingListException {
    String email = principal.getName();
    List<Long> comicIds = request.getIds();

    log.info(
        "Removing {} comic{} from the reading list for {}: id={}",
        comicIds.size(),
        comicIds.size() == 1 ? "" : "s",
        email,
        id);

    int count = this.readingListService.removeComicsFromList(email, id, comicIds);

    return new RemoveComicsFromReadingListResponse(count);
  }
}