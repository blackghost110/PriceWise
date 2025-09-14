import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {ListService} from '@features/catalog/service/list.service';
import {ListProductService} from '@features/catalog/service/list-product.service';
import {MatButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AddListDialog} from '@features/catalog/component/dialog/add-list-dialog/add-list-dialog';
import {MatDialog} from '@angular/material/dialog';
import {UpdateListDialog} from '@features/catalog/component/dialog/update-list-dialog/update-list-dialog';
import {DialogService} from '@shared/component/confirm-dialog/dialog.service';

@Component({
  selector: 'app-personal-list',
  imports: [
    Header,
    Footer,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    Header,
    MatInput,
    MatSuffix,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './personal-list.html',
  styleUrl: './personal-list.css'
})
export class PersonalList implements OnInit{

  dialog = inject(MatDialog);
  listService = inject(ListService)
  listProductService = inject(ListProductService)
  dialogService = inject(DialogService)


  personalList = this.listService.personalList
  listProducts = this.listProductService.listProducts

  selectedList = signal('0');
  searchTerm = signal('');


  constructor() {
    effect(() => {
        this.listProductService.getListProducts(Number(this.selectedList())).subscribe()
    })

  }

  ngOnInit() {
    this.listService.getLists().subscribe()
  }

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const products = this.listProducts();

    if (!search || !products) {
      return products;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return products.filter(product => {
      const searchableText = [
        product.name,
        product.brand || '',
        product.quantity.toString(),
        product.unit,
        product.storeName,
        product.storeCity,
        product.storeStreet,
        product.storePostalCode,
        product.storeNumber,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

  })



  onOpenDialogAddList() {
    const dialogRef = this.dialog.open(AddListDialog);
  }
  onOpenDialogUpdateList() {
    const dialogRef = this.dialog.open(UpdateListDialog, {
      data: { listId: this.selectedList() }
    });
  }
  onOpenDialogConfirm() {
    this.dialogService.confirmDialog({
      title: 'Êtes vous sûr ?',
      message: 'En confirmant cette action, vous supprimerez la liste, ainsi que les produits de celui-ci',
      confirmCaption: 'Supprimer',
      cancelCaption: 'Annuler'
    }).subscribe((result) => {
      if (result) {
        console.log('Suppression de la liste')
        this.listService.deleteList(Number(this.selectedList())).subscribe()
      }
    })
  }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }

  onClearSearch() {
    this.searchTerm.set('')
  }

}
