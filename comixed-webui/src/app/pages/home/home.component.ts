/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { TitleService } from '@app/core/services/title.service';
import { selectServerStatusState } from '@app/selectors/server-status.selectors';
import { Store } from '@ngrx/store';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { selectComicBookListState } from '@app/comic-books/selectors/comic-book-list.selectors';
import { LastRead } from '@app/last-read/models/last-read';
import { selectLastReadListState } from '@app/last-read/selectors/last-read-list.selectors';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { LibraryState } from '@app/library/reducers/library.reducer';

@Component({
  selector: 'cx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  serverStateSubscription: Subscription;
  loading = false;
  taskCount = 0;

  libraryStateSubscription: Subscription;
  libraryState: LibraryState = null;
  comicBookListStateSubscription: Subscription;
  comicBooks: ComicBook[] = [];
  lastReadStateSubscription: Subscription;
  lastRead: LastRead[] = [];

  constructor(
    private logger: LoggerService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private store: Store<any>
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.serverStateSubscription = this.store
      .select(selectServerStatusState)
      .subscribe(state => {
        this.taskCount = state.taskCount;
      });
    this.libraryStateSubscription = this.store
      .select(selectLibraryState)
      .subscribe(state => {
        this.logger.debug('Library state updated:', state);
        this.libraryState = state;
      });
    this.comicBookListStateSubscription = this.store
      .select(selectComicBookListState)
      .subscribe(state => {
        this.loading = state.loading;
        // don't process comics till we've finished loading
        if (!state.loading && state.lastPayload) {
          this.comicBooks = state.comicBooks;
        }
      });
    this.lastReadStateSubscription = this.store
      .select(selectLastReadListState)
      .subscribe(state => {
        this.lastRead = state.entries;
      });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from server state changes');
    this.serverStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic updates');
    this.comicBookListStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from last read updates');
    this.lastReadStateSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Loading translations');
    this.titleService.setTitle(this.translateService.instant('home.tab-title'));
  }
}
