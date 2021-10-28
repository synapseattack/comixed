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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicFileDetailsComponent } from './comic-file-details.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from '@app/comic-files/comic-file.fixtures';
import { setComicFilesSelectedState } from '@app/comic-files/actions/comic-file-list.actions';
import { ComicPageComponent } from '@app/comic-books/components/comic-page/comic-page.component';

describe('ComicFileDetailsComponent', () => {
  const FILE = COMIC_FILE_2;
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
  const initialState = {};

  let component: ComicFileDetailsComponent;
  let fixture: ComponentFixture<ComicFileDetailsComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      declarations: [ComicFileDetailsComponent, ComicPageComponent],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileDetailsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggling selection', () => {
    beforeEach(() => {
      component.file = FILE;
    });

    describe('selecting the comic', () => {
      beforeEach(() => {
        component.selected = false;
        component.onSelectFile();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: true })
        );
      });
    });

    describe('deselecting the comic', () => {
      beforeEach(() => {
        component.selected = true;
        component.onSelectFile();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: false })
        );
      });
    });
  });
});