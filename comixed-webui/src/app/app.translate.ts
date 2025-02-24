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

import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { HttpBackend } from '@angular/common/http';

export function HttpLoaderFactory(
  httpBackend: HttpBackend
): MultiTranslateHttpLoader {
  return new MultiTranslateHttpLoader(httpBackend, [
    { prefix: './assets/i18n/', suffix: '/admin.json' },
    { prefix: './assets/i18n/', suffix: '/app.json' },
    { prefix: './assets/i18n/', suffix: '/collections.json' },
    { prefix: './assets/i18n/', suffix: '/comic-books.json' },
    { prefix: './assets/i18n/', suffix: '/comic-files.json' },
    { prefix: './assets/i18n/', suffix: '/comic-metadata.json' },
    { prefix: './assets/i18n/', suffix: '/comic-pages.json' },
    { prefix: './assets/i18n/', suffix: '/core.json' },
    { prefix: './assets/i18n/', suffix: '/last-read.json' },
    { prefix: './assets/i18n/', suffix: '/library.json' },
    { prefix: './assets/i18n/', suffix: '/lists.json' },
    { prefix: './assets/i18n/', suffix: '/user.json' }
  ]);
}
