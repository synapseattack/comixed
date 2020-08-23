/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>ImportComicFilesRequest</code> represents the payload for a request to import comics into
 * the library.
 *
 * @author Darryl L. Pierce
 */
public class ImportComicFilesRequest {
  @JsonProperty("filenames")
  @Getter
  @Setter
  private List<String> filenames = new ArrayList<>();

  @JsonProperty("ignoreMetadata")
  @Getter
  @Setter
  private boolean ignoreMetadata;

  @JsonProperty("deleteBlockedPages")
  @Getter
  @Setter
  private boolean deleteBlockedPages;

  public ImportComicFilesRequest(
      final List<String> filenames,
      final boolean deleteBlockedPages,
      final boolean ignoreMetadata) {
    this.filenames = filenames;
    this.deleteBlockedPages = deleteBlockedPages;
    this.ignoreMetadata = ignoreMetadata;
  }
}