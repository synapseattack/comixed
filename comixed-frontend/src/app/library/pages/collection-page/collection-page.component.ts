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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { LibraryDisplayAdaptor } from 'app/library';
import { CollectionAdaptor } from 'app/library/adaptors/collection.adaptor';
import { CollectionEntry } from 'app/library/models/collection-entry';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collection-page',
  templateUrl: './collection-page.component.html',
  styleUrls: ['./collection-page.component.scss']
})
export class CollectionPageComponent implements OnInit, OnDestroy {
  activatedRouteSubscription: Subscription;
  langChangeSubscription: Subscription;
  collectionType: CollectionType;
  collectionSubscription: Subscription;
  collection: CollectionEntry[];
  rowsSubscription: Subscription;
  rows = 10;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private collectionAdaptor: CollectionAdaptor,
    private displayAdaptor: LibraryDisplayAdaptor,
    private translateService: TranslateService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(
      params => {
        const typeName = params['collectionType'].toString().toUpperCase();
        this.collectionType = CollectionType[typeName] as CollectionType;
        if (!!this.collectionType) {
          this.collectionSubscription = this.collectionAdaptor.entries$.subscribe(
            collection => (this.collection = collection)
          );
          this.collectionAdaptor.getCollection(this.collectionType);
        } else {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'collections.error.invalid-collection-type',
              { name: typeName }
            )
          });
          this.router.navigateByUrl('/home');
        }
      }
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.rowsSubscription = this.displayAdaptor.rows$.subscribe(
      rows => (this.rows = rows)
    );
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.collectionSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('collection-page.title', {
        collectionType: this.collectionType.toString().toUpperCase()
      })
    );
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant('breadcrumb.collections.root')
      },
      {
        label: this.translateService.instant(
          `breadcrumb.collections.${this.collectionType}`
        ),
        routerLink: [`/collections/${this.collectionType}`]
      }
    ]);
  }
}