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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SelectedComicsComponent } from './selected-comics.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4
} from '@app/comic-books/comic-books.fixtures';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SelectedComicsComponent', () => {
  const COMICS = [
    COMIC_BOOK_1.detail,
    COMIC_BOOK_2.detail,
    COMIC_BOOK_3.detail,
    COMIC_BOOK_4.detail
  ];
  const COMIC_BOOK = COMIC_BOOK_3;
  const COMIC_DETAIL = COMIC_BOOK.detail;

  let component: SelectedComicsComponent;
  let fixture: ComponentFixture<SelectedComicsComponent>;
  let dialog: MatDialog;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SelectedComicsComponent],
        imports: [NoopAnimationsModule, LoggerModule.forRoot(), MatDialogModule]
      }).compileComponents();

      fixture = TestBed.createComponent(SelectedComicsComponent);
      component = fixture.componentInstance;
      spyOn(component.selectionChanged, 'emit');
      dialog = TestBed.inject(MatDialog);
      spyOn(dialog, 'open');
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving comics to display', () => {
    describe('if comics were loaded', () => {
      beforeEach(() => {
        component.comics = COMICS;
      });

      it('emits an event', () => {
        expect(component.selectionChanged.emit).toHaveBeenCalledWith(COMICS[0]);
      });
    });

    describe('if no comics were loaded', () => {
      beforeEach(() => {
        component.comics = [];
      });

      it('does not emit an event', () => {
        expect(component.selectionChanged.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the selection has changed', () => {
    beforeEach(() => {
      component.onSelectionChanged(COMIC_DETAIL);
    });

    it('emits an event', () => {
      expect(component.selectionChanged.emit).toHaveBeenCalledWith(
        COMIC_DETAIL
      );
    });
  });

  describe('showing the comic details', () => {
    let event: MouseEvent;

    beforeEach(() => {
      event = new MouseEvent('test');
      spyOn(event, 'stopPropagation');
      component.onShowComicDetails(COMIC_BOOK, event);
    });

    it('opens the comic details dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(ComicDetailsDialogComponent, {
        data: COMIC_BOOK
      });
    });

    it('prevents the mouse event from propagating', () => {
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });
});
