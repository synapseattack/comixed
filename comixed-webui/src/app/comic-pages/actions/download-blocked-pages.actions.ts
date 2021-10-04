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

import { createAction, props } from '@ngrx/store';
import { DownloadDocument } from '@app/core/models/download-document';

export const downloadBlockedPages = createAction(
  '[Download Blocked Pages] Downloads the blocked page list'
);

export const blockedPagesDownloaded = createAction(
  '[Download Blocked Pages] Blocked pages downloaded',
  props<{ document: DownloadDocument }>()
);

export const downloadBlockedPagesFailed = createAction(
  '[Download Blocked Pages] Failed to download blocked pages'
);