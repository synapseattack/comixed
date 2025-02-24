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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { SetComicsReadEffects } from './set-comics-read.effects';
import { LastReadService } from '@app/last-read/services/last-read.service';
import { AlertService } from '@app/core/services/alert.service';
import { COMIC_DETAIL_4 } from '@app/comic-books/comic-books.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  comicBooksReadSet,
  setComicBooksRead,
  setComicBooksReadFailed
} from '@app/last-read/actions/set-comics-read.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import {
  lastReadDateRemoved,
  lastReadDateUpdated
} from '@app/last-read/actions/last-read-list.actions';
import { LAST_READ_2 } from '@app/last-read/last-read.fixtures';

describe('UpdateReadStatusEffects', () => {
  const COMIC = COMIC_DETAIL_4;
  const READ = Math.random() > 0.5;
  const ENTRY = LAST_READ_2;

  let actions$: Observable<any>;
  let effects: SetComicsReadEffects;
  let lastReadService: jasmine.SpyObj<LastReadService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        SetComicsReadEffects,
        provideMockActions(() => actions$),
        {
          provide: LastReadService,
          useValue: {
            setRead: jasmine.createSpy('LastReadService.setRead()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(SetComicsReadEffects);
    lastReadService = TestBed.inject(
      LastReadService
    ) as jasmine.SpyObj<LastReadService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('updating the read state of comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRY;
      const action = setComicBooksRead({ comicBooks: [COMIC], read: READ });
      const outcome = comicBooksReadSet();

      actions$ = hot('-a', { a: action });
      lastReadService.setRead.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setComicsRead$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setComicBooksRead({ comicBooks: [COMIC], read: READ });
      const outcome = setComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.setRead.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setComicsRead$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setComicBooksRead({ comicBooks: [COMIC], read: READ });
      const outcome = setComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.setRead.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setComicsRead$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
