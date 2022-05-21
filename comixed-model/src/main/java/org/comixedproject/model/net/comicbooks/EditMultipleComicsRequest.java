/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project.
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

package org.comixedproject.model.net.comicbooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * <code>EditMultipleComicsRequest</code> contains the details to be changed for a set of comics.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class EditMultipleComicsRequest {
  @JsonProperty("ids")
  @Getter
  private List<Long> ids;

  @JsonProperty("publisher")
  @Getter
  private String publisher;

  @JsonProperty("series")
  @Getter
  private String series;

  @JsonProperty("volume")
  @Getter
  private String volume;

  @JsonProperty("issueNumber")
  @Getter
  private String issueNumber;

  @JsonProperty("imprint")
  @Getter
  private String imprint;
}