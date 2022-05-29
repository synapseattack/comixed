/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.opds.rest;

import static org.comixedproject.opds.model.OPDSAcquisitionFeed.ACQUISITION_FEED_LINK_TYPE;
import static org.comixedproject.opds.model.OPDSNavigationFeed.NAVIGATION_FEED_LINK_TYPE;
import static org.comixedproject.opds.rest.OPDSLibraryController.SELF;
import static org.comixedproject.opds.rest.OPDSLibraryController.SUBSECTION;

import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.rest.AuditableRestEndpoint;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.*;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>OPDSDateController</code> provides endpoints for listing comics by store date year and
 * month.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSDateController {
  private static final String STORE_DATE_YEARS_ID = "20";
  private static final int COMIC_STORE_DATE_FOR_YEAR_ID = 20;

  @Autowired private ComicBookService comicBookService;
  @Autowired private OPDSUtils opdsUtils;

  private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("MMM dd yyyy");

  /**
   * Returns navigation links for the store date years in the library.
   *
   * @return the years as navigation links
   */
  @GetMapping(value = "/opds/dates/released", produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableRestEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed loadYears(
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    log.info("Loading comic years");
    final OPDSNavigationFeed response =
        new OPDSNavigationFeed("Store Date: Years", STORE_DATE_YEARS_ID);
    this.comicBookService.getYearsForComics().stream()
        .sorted()
        .forEach(
            year -> {
              log.trace("Adding year: {}", year);
              OPDSNavigationFeedEntry entry =
                  new OPDSNavigationFeedEntry(String.valueOf(year), String.valueOf(year));
              entry.setContent(new OPDSNavigationFeedContent(String.format("The Year %d", year)));
              entry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/dates/released/years/%d/weeks?unread=%s", year, unread)));
              response.getEntries().add(entry);
            });
    return response;
  }

  /**
   * Returns navigation links for the weeks of the given year in the library.
   *
   * @param year the year
   * @return the weeks as navigation links
   * @throws OPDSException if an error occurs
   */
  @GetMapping(
      value = "/opds/dates/released/years/{year}/weeks",
      produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableRestEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSNavigationFeed loadWeeksForYear(
      @PathVariable("year") @NonNull final Integer year,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread)
      throws OPDSException {
    log.info("Loading comics for year {}", year);
    final OPDSNavigationFeed response =
        new OPDSNavigationFeed(
            "Comics For Year: " + year, String.valueOf(COMIC_STORE_DATE_FOR_YEAR_ID + year));
    log.trace("Loading days with comics for year");
    this.comicBookService.getWeeksForYear(year).stream()
        .sorted()
        .forEach(
            weekNumber -> {
              log.trace("Adding week {} of {}", weekNumber, year);
              final Date weekStarts = this.getDateFor(year, weekNumber, Calendar.SUNDAY);
              final Date weekEnds = this.getDateFor(year, weekNumber, Calendar.SATURDAY);
              OPDSNavigationFeedEntry entry =
                  new OPDSNavigationFeedEntry(
                      String.format("Year %d Week %d", year, weekNumber),
                      String.valueOf(year + weekNumber));
              entry.setContent(
                  new OPDSNavigationFeedContent(
                      String.format(
                          "%s thru %s",
                          this.simpleDateFormat.format(weekStarts),
                          this.simpleDateFormat.format(weekEnds))));
              entry
                  .getLinks()
                  .add(
                      new OPDSLink(
                          ACQUISITION_FEED_LINK_TYPE,
                          SUBSECTION,
                          String.format(
                              "/opds/dates/released/years/%d/weeks/%d?unread=%s",
                              year, weekNumber, String.valueOf(unread))));
              response.getEntries().add(entry);
            });
    return response;
  }

  /**
   * Returns an acquisition feed for all comics in the given week of the given year.
   *
   * @param year the year
   * @param week the week
   * @return the comics as acquisition links
   */
  @GetMapping(
      value = "/opds/dates/released/years/{year}/weeks/{week}",
      produces = MediaType.APPLICATION_XML_VALUE)
  @AuditableRestEndpoint(logResponse = true)
  @PreAuthorize("hasRole('READER')")
  @ResponseBody
  public OPDSAcquisitionFeed loadComicsForYearAndWeek(
      final Principal principal,
      @PathVariable("year") @NonNull final Integer year,
      @PathVariable("week") @NonNull final Integer week,
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    log.info("Loading comics for year {}", year);
    final Date weekStarts = this.getDateFor(year, week, Calendar.SUNDAY);
    final Date weekEnds = this.getDateFor(year, week, Calendar.SATURDAY);

    final OPDSAcquisitionFeed response =
        new OPDSAcquisitionFeed(
            String.format(
                "Comics For Week Of %s To %s",
                simpleDateFormat.format(weekStarts), simpleDateFormat.format(weekEnds)),
            String.valueOf(COMIC_STORE_DATE_FOR_YEAR_ID + year));
    log.trace("Loading comics");
    this.comicBookService.getComicsForYearAndWeek(year, week, principal.getName(), unread).stream()
        .forEach(
            comicBook -> {
              log.trace("Adding comic to collection entries: {}", comicBook.getId());
              response.getEntries().add(this.opdsUtils.createComicEntry(comicBook));
            });
    response
        .getLinks()
        .add(
            new OPDSLink(
                NAVIGATION_FEED_LINK_TYPE,
                SELF,
                String.format(
                    "/opds/dates/released/years/%d/weeks/%d?unread=%s", year, week, unread)));
    return response;
  }

  private Date getDateFor(final Integer year, final Integer week, final int dayOfWeek) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.set(Calendar.YEAR, year);
    calendar.set(Calendar.WEEK_OF_YEAR, week);
    calendar.set(Calendar.DAY_OF_WEEK, dayOfWeek);
    return calendar.getTime();
  }
}
