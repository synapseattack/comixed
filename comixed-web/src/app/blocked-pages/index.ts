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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
  BLOCKED_PAGE_LIST_FEATURE_KEY,
  BlockedPageListState,
  reducer as blockedPageListReducer
} from './reducers/blocked-page-list.reducer';
import { ActionReducerMap } from '@ngrx/store';
import {
  BLOCKED_PAGE_DETAIL_FEATURE_KEY,
  BlockedPageDetailState,
  reducer as blockedPageDetailReducer
} from '@app/blocked-pages/reducers/blocked-page-detail.reducer';
import {
  BLOCK_PAGE_FEATURE_KEY,
  BlockPageState,
  reducer as blockPageReducer
} from '@app/blocked-pages/reducers/block-page.reducer';

export * from './blocked-pages.model';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface BlockedPagesModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [BLOCKED_PAGE_LIST_FEATURE_KEY]: BlockedPageListState;
  [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: BlockedPageDetailState;
  [BLOCK_PAGE_FEATURE_KEY]: BlockPageState;
}

export type ModuleState = BlockedPagesModuleState;

export const reducers: ActionReducerMap<BlockedPagesModuleState> = {
  router: routerReducer,
  [BLOCKED_PAGE_LIST_FEATURE_KEY]: blockedPageListReducer,
  [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: blockedPageDetailReducer,
  [BLOCK_PAGE_FEATURE_KEY]: blockPageReducer
};