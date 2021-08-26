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

import { Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import {
  LOAD_READING_LIST_URL,
  LOAD_READING_LISTS_URL,
  SAVE_READING_LIST,
  UPDATE_READING_LIST
} from '@app/lists/lists.constants';
import { ReadingList } from '@app/lists/models/reading-list';

@Injectable({
  providedIn: 'root'
})
export class ReadingListService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadEntries(): Observable<any> {
    this.logger.trace('Load reading list entries for user');
    return this.http.get(interpolate(LOAD_READING_LISTS_URL));
  }

  loadOne(args: { id: number }): Observable<any> {
    this.logger.trace('Load one reading list:', args);
    return this.http.get(interpolate(LOAD_READING_LIST_URL, { id: args.id }));
  }

  save(args: { list: ReadingList }): Observable<any> {
    if (!!args.list.id) {
      this.logger.trace('Updating reading list:', args);
      return this.http.put(
        interpolate(UPDATE_READING_LIST, { id: args.list.id }),
        args.list
      );
    } else {
      this.logger.trace('Saving reading list:', args);
      return this.http.post(interpolate(SAVE_READING_LIST), args.list);
    }
  }
}