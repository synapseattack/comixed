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

import { LastRead } from './models/last-read';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from '../comic-book/comic-book.fixtures';

export const LAST_READ_1: LastRead = {
  id: 1,
  comic: COMIC_1,
  lastRead: new Date().getTime()
};

export const LAST_READ_2: LastRead = {
  id: 2,
  comic: COMIC_2,
  lastRead: new Date().getTime()
};

export const LAST_READ_3: LastRead = {
  id: 3,
  comic: COMIC_3,
  lastRead: new Date().getTime()
};

export const LAST_READ_4: LastRead = {
  id: 4,
  comic: COMIC_4,
  lastRead: new Date().getTime()
};

export const LAST_READ_5: LastRead = {
  id: 5,
  comic: COMIC_5,
  lastRead: new Date().getTime()
};
