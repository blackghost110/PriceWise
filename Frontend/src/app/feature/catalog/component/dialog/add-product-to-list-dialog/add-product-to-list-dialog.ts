import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {ListService} from '@features/catalog/service/list.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CreateListProductPayload} from '@features/catalog/data/payload/create-list-product.payload';
import {ListProductService} from '@features/catalog/service/list-product.service';
import {AddListDialog} from '@features/catalog/component/dialog/add-list-dialog/add-list-dialog';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {tap} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';

@Component({
  selector: 'app-add-product-to-list-dialog',
  imports: [
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    ReactiveFormsModule
  ],
  templateUrl: './add-product-to-list-dialog.html',
  styleUrl: './add-product-to-list-dialog.css'
})
export class AddProductToListDialog implements OnInit {

  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddProductToListDialog>);
  data = inject(MAT_DIALOG_DATA);

  listService = inject(ListService);
  listProductService = inject(ListProductService);
  private errorMessageService = inject(ErrorMessageService)



  // injected data
  product: ProductDto = this.data.product;

  selectedList = signal('0');
  personalList = this.listService.personalList

  errorMessage = signal<string | null>(null);


  productToListForm = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.min(0.01)]
    }),
  })

  ngOnInit() {
    this.listService.getLists().subscribe()
  }


  onAddProductToList() {
    // Vérifier qu'une liste est sélectionnée
    if (this.selectedList() === '0') {
      console.log('Aucune liste sélectionnée');
      return;
    }
    this.errorMessage.set(null);

    const payload: CreateListProductPayload = {
      listId: +this.selectedList(),
      productId: this.product.productId // ou this.product.id selon votre interface ProductDto
    };

    console.log('add product to list payload:', payload);

    this.listProductService.addProductToList(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((apiResponse: ApiResponse) => {
        if (!apiResponse.result) {
          console.log('apiResponse details : ', apiResponse)
          this.errorMessage.set(this.errorMessageService.getErrorMessage(apiResponse.code))
        }
      }),
    ).subscribe({
      next: (response) => {
        if (response.result) {
          this.dialogRef.close(true); // Passer true pour indiquer le succès
        }
      }
    });

  }

  onOpenDialogAddList() {
    const dialogRef = this.dialog.open(AddListDialog, {
      width: '400px',
    });
  }

  onClose() {
    this.dialogRef.close();
  }


}
