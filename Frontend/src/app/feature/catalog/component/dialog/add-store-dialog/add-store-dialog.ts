import {Component, DestroyRef, inject, signal} from '@angular/core';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CreateStorePayload} from '@features/catalog/data/payload/create-store.payload';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StoreService} from '@features/catalog/service/store.service';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {debounceTime, distinctUntilChanged, map, startWith, tap} from 'rxjs';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {ApiResponse} from '@shared/api/data/api.response';

@Component({
  selector: 'app-add-store-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger
  ],
  templateUrl: './add-store-dialog.html',
  styleUrl: './add-store-dialog.css'
})
export class AddStoreDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddStoreDialog>);

  storeService = inject(StoreService)
  private errorMessageService = inject(ErrorMessageService)

  errorMessage = signal<string | null>(null);

  allStores = signal<StoreDto[]>([]);
  filteredStores = signal<StoreDto[]>([]);


  constructor() {
    this.storeService.getStores()
      .subscribe(stores => {
        this.allStores.set(stores.data)
        this.filteredStores.set([])
      })

    this.setupNameAutocomplete();
  }


  storeForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    street: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    number: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    postalCode: new FormControl<number | null>(null, {
      validators: [Validators.required]
    }),
    city: new FormControl<string>('', {
      validators: [Validators.required]
    }),

  })




  onAddStore() {
    console.log(this.storeForm)
    if (this.storeForm.invalid) {
      console.log('invalid form')
      return
    }
    this.errorMessage.set(null);

    const formValue = this.storeForm.value;
    const payload: CreateStorePayload = {
      name: formValue.name!,
      street: formValue.street!,
      number: formValue.number!,
      postalCode: formValue.postalCode!,
      city: formValue.city!
    }
    console.log('price payload :', payload)

    this.storeService.addStore(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((apiResponse: ApiResponse) => {
        if (!apiResponse.result) {
          console.log('apiResponse details : ', apiResponse)
          this.errorMessage.set(this.errorMessageService.getErrorMessage(apiResponse.code))
        }
      }),
    ).subscribe(response => {
      if (response.result) {
        this.dialogRef.close();
      }
    })


  }

  private setupNameAutocomplete() {
    const nameControl = this.storeForm.get('street');

    if (nameControl) {
      nameControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        map(value => this.filterStores(value || '')),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(filtered => {
        this.filteredStores.set(filtered);
        this.errorMessage.set(null);
      });
    }
  }

  private filterStores(searchTerm: string): StoreDto[] {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const filterValue = searchTerm.toLowerCase();

    return this.allStores().filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.city.toLowerCase().includes(filterValue) ||
      product.street.toLowerCase().includes(filterValue) ||
      product.number.toLowerCase().includes(filterValue) ||
      product.postalCode.toString().toLowerCase().includes(filterValue)
    ).slice(0, 5); // Limiter à 5 suggestions
  }

  onStoreSelected(selectedStore: StoreDto) {
    // Pré-remplir le formulaire avec les données du produit sélectionné
    this.storeForm.patchValue({
      name: selectedStore.name,
      city: selectedStore.city,
      street: selectedStore.street,
      number: selectedStore.number,
      postalCode: Number(selectedStore.postalCode)
    });

    // Vider les suggestions
    this.filteredStores.set([]);
  }


  onClose() {
    this.dialogRef.close();
  }

}
