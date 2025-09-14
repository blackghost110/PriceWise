import {Component, DestroyRef, inject, signal} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField} from "@angular/material/form-field";
import {MatInput, MatLabel} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CreateListPayload} from '@features/catalog/data/payload/create-list.payload';
import {ListService} from '@features/catalog/service/list.service';
import {ProductDto} from '@features/catalog/data/dto/product.dto';

@Component({
  selector: 'app-add-list-dialog',
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogContent,
        MatDialogTitle,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule
    ],
  templateUrl: './add-list-dialog.html',
  styleUrl: './add-list-dialog.css'
})
export class AddListDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddListDialog>);

  listService = inject(ListService)

  isListConflict = signal(false)




  listForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  })




  onAddList() {
    console.log(this.listForm)
    if (this.listForm.invalid) {
      console.log('invalid form')
      return
    }
    const formValue = this.listForm.value;
    const payload: CreateListPayload = {
      name: formValue.name!,
    }
    console.log('price payload :', payload)

    this.listService.addList(payload).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      if (!response.result) {
        this.isListConflict.set(true);
      } else {
        this.dialogRef.close();
      }
    })


  }








  onClose() {
    this.dialogRef.close();
  }


}
