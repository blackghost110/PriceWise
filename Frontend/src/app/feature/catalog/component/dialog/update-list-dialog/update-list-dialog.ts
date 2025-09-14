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
import {ListService} from '@features/catalog/service/list.service';
import {CreateListPayload} from '@features/catalog/data/payload/create-list.payload';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductDto} from '@features/catalog/data/dto/product.dto';

@Component({
  selector: 'app-update-list-dialog',
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
  templateUrl: './update-list-dialog.html',
  styleUrl: './update-list-dialog.css'
})
export class UpdateListDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<UpdateListDialog>);
  listService = inject(ListService)
  data = inject(MAT_DIALOG_DATA);

  // injected dialog data
  listId: number = this.data.listId;

  isListConflict = signal(false)



  listForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  })




  onUpdateList() {
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

    this.listService.updateList(payload, this.listId).pipe(
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
