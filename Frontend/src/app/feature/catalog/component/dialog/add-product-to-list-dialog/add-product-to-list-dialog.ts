import {Component, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
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
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-product-to-list-dialog.css'
})
export class AddProductToListDialog implements OnInit {

  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<AddProductToListDialog>);
  private data = inject(MAT_DIALOG_DATA);

  private errorMessageService = inject(ErrorMessageService)

  private listService = inject(ListService);
  private listProductService = inject(ListProductService);



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
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close(true));

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
