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

import {
  COMIC_LIST_FEATURE_KEY,
  ComicListState
} from '../reducers/comic-list.reducer';
import {
  selectComicList,
  selectComicListCount,
  selectComicListDeletedCount,
  selectComicListReadCount,
  selectComicListState
} from './comic-list.selectors';
import { COMIC_1, COMIC_3, COMIC_5 } from '@app/library/library.fixtures';

describe('Comic List Selectors', () => {
  let state: ComicListState;

  beforeEach(() => {
    state = {
      comics: [
        { ...COMIC_1, lastRead: new Date().getTime(), deletedDate: null },
        { ...COMIC_3, lastRead: null, deletedDate: null },
        { ...COMIC_5, lastRead: null, deletedDate: new Date().getTime() }
      ]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicListState({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the comic list', () => {
    expect(selectComicList({ [COMIC_LIST_FEATURE_KEY]: state })).toEqual(
      state.comics
    );
  });

  it('should select the number of comics in the list', () => {
    expect(selectComicListCount({ [COMIC_LIST_FEATURE_KEY]: state })).toEqual(
      state.comics.length
    );
  });

  it('should select the number of read comics in the list', () => {
    expect(
      selectComicListReadCount({ [COMIC_LIST_FEATURE_KEY]: state })
    ).toEqual(state.comics.filter(comic => !!comic.lastRead).length);
  });

  it('should select the number of deleted comics in the list', () => {
    expect(
      selectComicListDeletedCount({ [COMIC_LIST_FEATURE_KEY]: state })
    ).toEqual(state.comics.filter(comic => !!comic.deletedDate).length);
  });
});
