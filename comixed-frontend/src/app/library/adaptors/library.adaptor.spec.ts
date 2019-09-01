/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { LibraryAdaptor } from './library.adaptor';
import { TestBed } from '@angular/core/testing';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/library/models/scan-type.fixtures';
import { Store, StoreModule } from '@ngrx/store';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import * as LibraryActions from '../actions/library.actions';
import { AppState } from 'app/library';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/library/models/comic-format.fixtures';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/library/models/comic.fixtures';
import { generate_random_string } from '../../../test/testing-utils';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';

describe('LibraryAdaptor', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const COMIC = COMIC_1;
  const HASH = generate_random_string();
  const IDS = [7, 17, 65, 1, 29, 71];

  let adaptor: LibraryAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ library_state: reducer })],
      providers: [LibraryAdaptor]
    });

    adaptor = TestBed.get(LibraryAdaptor);
    store = TestBed.get(Store);
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  it('fires an action on reset', () => {
    spyOn(store, 'dispatch');
    adaptor.reset_library();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryResetLibrary()
    );
  });

  it('provides a way to update the scan types', () => {
    adaptor._scan_type$.next(SCAN_TYPES);
    adaptor.scan_type$.subscribe(response =>
      expect(response).toEqual(SCAN_TYPES)
    );
  });

  describe('getting the set of scan types', () => {
    it('returns an empty array when none are loaded', () => {
      expect(adaptor.scan_types).toEqual([]);
    });

    it('returns the set when loaded', () => {
      store.dispatch(
        new LibraryActions.LibraryGotScanTypes({ scan_types: SCAN_TYPES })
      );
      expect(adaptor.scan_types).toEqual(SCAN_TYPES);
    });
  });

  it('provides a way to update the formats', () => {
    adaptor._format$.next(FORMATS);
    adaptor.format$.subscribe(response => expect(response).toEqual(FORMATS));
  });

  describe('getting the comic format types', () => {
    it('returns an empty array when none are loaded', () => {
      expect(adaptor.formats).toEqual([]);
    });

    it('returns the set when loaded', () => {
      store.dispatch(
        new LibraryActions.LibraryGotFormats({ formats: FORMATS })
      );
      expect(adaptor.formats).toEqual(FORMATS);
    });
  });

  it('provides a way to update the comic set', () => {
    adaptor._comic$.next(COMICS);
    adaptor.comic$.subscribe(response => expect(response).toEqual(COMICS));
  });

  it('fires an action when getting comic updates', () => {
    const LATEST_UPDATED_DATE = new Date().getTime();
    const TIMEOUT = 60;
    const MAXIMUM = 100;

    spyOn(store, 'dispatch');
    adaptor._latest_updated_date = LATEST_UPDATED_DATE;
    adaptor._timeout = TIMEOUT;
    adaptor._maximum = MAXIMUM;
    adaptor.get_comic_updates();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryGetUpdates({
        later_than: LATEST_UPDATED_DATE,
        timeout: TIMEOUT,
        maximum: MAXIMUM
      })
    );
  });

  it('returns an empty array when no comics are loaded', () => {
    expect(adaptor.comics).toEqual([]);
  });

  describe('when receiving comics', () => {
    const PENDING_IMPORTS = 17;
    const PENDING_RESCANS = 29;

    beforeEach(() => {
      store.dispatch(
        new LibraryActions.LibraryGotUpdates({
          comics: COMICS,
          last_read_dates: LAST_READ_DATES,
          pending_imports: PENDING_IMPORTS,
          pending_rescans: PENDING_RESCANS
        })
      );
    });

    it('returns the set when loaded', () => {
      expect(adaptor.comics).toEqual(COMICS);
    });

    it('updates the pending import count', () => {
      adaptor.pending_import$.subscribe(response =>
        expect(response).toEqual(PENDING_IMPORTS)
      );
    });

    it('updates the pending rescan count', () => {
      adaptor.pending_rescan$.subscribe(response =>
        expect(response).toEqual(PENDING_RESCANS)
      );
    });
  });

  it('provides a way to update the current comic', () => {
    adaptor._current_comic$.next(COMIC);
    adaptor.current_comic$.subscribe(response =>
      expect(response).toEqual(COMIC)
    );
  });

  describe('getting the current comic', () => {
    it('has no comic by default', () => {
      adaptor.current_id = -1;
      expect(adaptor.current_comic).toBeNull();
    });

    it('has a comic when set', () => {
      adaptor.current_id = COMIC.id;
      store.dispatch(
        new LibraryActions.LibrarySetCurrentComic({ comic: COMIC })
      );
      expect(adaptor.current_comic).toEqual(COMIC);
    });

    it('can update the current comic', () => {
      spyOn(store, 'dispatch').and.callThrough();
      adaptor.current_id = COMIC.id;
      adaptor.current_comic = COMIC;
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibrarySetCurrentComic({ comic: COMIC })
      );
      expect(adaptor.current_comic).toEqual(COMIC);
    });
  });

  it('fires an action when starting a rescan', () => {
    spyOn(store, 'dispatch');
    adaptor.start_rescan();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryStartRescan()
    );
  });

  it('fires an action when updating a comic', () => {
    spyOn(store, 'dispatch');
    adaptor.save_comic(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryUpdateComic({ comic: COMIC })
    );
  });

  it('fires an action when clearing metadata from a comic', () => {
    spyOn(store, 'dispatch');
    adaptor.clear_metadata(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryClearMetadata({ comic: COMIC })
    );
  });

  describe('when setting the blocked state for a hash', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    it('fires an action when blocking', () => {
      adaptor.block_page_hash(HASH);
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryBlockPageHash({ hash: HASH, blocked: true })
      );
    });

    it('fires an action when unblocking', () => {
      adaptor.unblock_page_hash(HASH);
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryBlockPageHash({ hash: HASH, blocked: false })
      );
    });
  });

  it('fires an action when deleting multiple comics', () => {
    spyOn(store, 'dispatch');
    adaptor.delete_comics_by_id(IDS);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryDeleteMultipleComics({ ids: IDS })
    );
  });
});