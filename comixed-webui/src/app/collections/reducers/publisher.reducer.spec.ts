/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { initialState, PublisherState, reducer } from './publisher.reducer';
import {
  loadPublisherDetail,
  loadPublisherDetailFailed,
  loadPublishers,
  loadPublishersFailed,
  publisherDetailLoaded,
  publishersLoaded
} from '@app/collections/actions/publisher.actions';
import {
  PUBLISHER_1,
  PUBLISHER_2,
  PUBLISHER_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';

describe('Publisher Reducer', () => {
  const PUBLISHERS = [PUBLISHER_1, PUBLISHER_2, PUBLISHER_3];
  const PUBLISHER = PUBLISHER_3;
  const DETAIL = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];

  let state: PublisherState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no publishers', () => {
      expect(state.publishers).toEqual([]);
    });

    it('has no detail', () => {
      expect(state.detail).toEqual([]);
    });
  });

  describe('getting all publishers', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false, publishers: PUBLISHERS },
        loadPublishers()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('resets the publisher list', () => {
      expect(state.publishers).toEqual([]);
    });
  });

  describe('receiving all publishers', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: true, publishers: [] },
        publishersLoaded({ publishers: PUBLISHERS })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the list of publishers', () => {
      expect(state.publishers).toEqual(PUBLISHERS);
    });
  });

  describe('failure to get all publishers', () => {
    beforeEach(() => {
      state = reducer({ ...initialState, busy: true }, loadPublishersFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('loading a single publisher', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, detail: DETAIL },
        loadPublisherDetail({ name: PUBLISHER.name })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the detail', () => {
      expect(state.detail).toEqual([]);
    });
  });

  describe('receiving a single publisher', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, detail: [] },
        publisherDetailLoaded({ detail: DETAIL })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the publisher detail', () => {
      expect(state.detail).toEqual(DETAIL);
    });
  });

  describe('failure to receive a single publisher', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadPublisherDetailFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
