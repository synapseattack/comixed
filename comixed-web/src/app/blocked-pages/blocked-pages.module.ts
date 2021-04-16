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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import {
  BLOCKED_PAGE_LIST_FEATURE_KEY,
  reducer as blockedPageListReducer
} from './reducers/blocked-page-list.reducer';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { BlockedPageListPageComponent } from './pages/blocked-page-list-page/blocked-page-list-page.component';
import { BlockedPagesRouting } from './blocked-pages.routing';
import { BlockedPageListEffects } from '@app/blocked-pages/effects/blocked-page-list.effects';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BlockedPageDetailPageComponent } from './pages/blocked-page-detail-page/blocked-page-detail-page.component';
import { MatCardModule } from '@angular/material/card';
import {
  BLOCKED_PAGE_DETAIL_FEATURE_KEY,
  reducer as blockedPageDetailReducer
} from '@app/blocked-pages/reducers/blocked-page-detail.reducer';
import { BlockedPageDetailEffects } from '@app/blocked-pages/effects/blocked-page-detail.effects';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TragicallySlickEditInPlaceModule } from '@tragically-slick/edit-in-place';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  BLOCK_PAGE_FEATURE_KEY,
  reducer as blockPageReducer
} from '@app/blocked-pages/reducers/block-page.reducer';
import { BlockPageEffects } from '@app/blocked-pages/effects/block-page.effects';

@NgModule({
  declarations: [BlockedPageListPageComponent, BlockedPageDetailPageComponent],
  imports: [
    CommonModule,
    BlockedPagesRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(
      BLOCKED_PAGE_LIST_FEATURE_KEY,
      blockedPageListReducer
    ),
    StoreModule.forFeature(
      BLOCKED_PAGE_DETAIL_FEATURE_KEY,
      blockedPageDetailReducer
    ),
    StoreModule.forFeature(BLOCK_PAGE_FEATURE_KEY, blockPageReducer),
    EffectsModule.forFeature([
      BlockedPageListEffects,
      BlockedPageDetailEffects,
      BlockPageEffects
    ]),
    MatTableModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TragicallySlickEditInPlaceModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [CommonModule]
})
export class BlockedPagesModule {}