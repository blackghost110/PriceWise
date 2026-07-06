import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CreateStorePayload} from '@features/catalog/data/payload/create-store.payload';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StoreService} from '@features/catalog/service/store.service';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {debounceTime, distinctUntilChanged, map, startWith, catchError, switchMap, of, EMPTY} from 'rxjs';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {StoreBrandDto} from '@features/catalog/data/dto/store-brand.dto';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {HttpErrorResponse} from '@angular/common/http';

const COLOR_CONTROL_NAMES = ['textColor', 'bgColor', 'useGradient', 'gradientColor'] as const;

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
    MatAutocompleteTrigger,
    MatCheckbox
  ],
  templateUrl: './add-store-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  // Verrouillage des couleurs quand une marque existe déjà pour le nom saisi
  brandLocked = signal(false);
  lockedBrandName = signal<string | null>(null);


  constructor() {
    this.storeService.getStores()
      .subscribe(stores => {
        this.allStores.set(stores)
        this.filteredStores.set([])
      })

    this.setupNameAutocomplete();
    this.setupBrandLookup();
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

    // Apparence du badge du magasin
    textColor: new FormControl<string>('#ffffff', { nonNullable: true }),
    bgColor: new FormControl<string>('#43a047', { nonNullable: true }),
    useGradient: new FormControl<boolean>(false, { nonNullable: true }),
    gradientColor: new FormControl<string>('#e30613', { nonNullable: true }),

  })




  onAddStore() {
    console.log(this.storeForm)
    if (this.storeForm.invalid) {
      console.log('invalid form')
      return
    }
    this.errorMessage.set(null);

    const formValue = this.storeForm.getRawValue();
    const payload: CreateStorePayload = {
      name: formValue.name!,
      street: formValue.street!,
      number: formValue.number!,
      postalCode: formValue.postalCode!,
      city: formValue.city!,
      textColor: formValue.textColor,
      bgColor: formValue.bgColor,
      gradientColor: formValue.useGradient ? formValue.gradientColor : null,
    }
    console.log('price payload :', payload)

    this.storeService.addStore(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close())


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

    // Le magasin sélectionné porte déjà sa marque (couleurs) : on la reprend directement
    this.applyBrand(selectedStore.brand ?? null);

    // Vider les suggestions
    this.filteredStores.set([]);
  }

  /**
   * Surveille le nom saisi : si une marque (couleurs) existe déjà pour ce nom,
   * les pickers sont pré-remplis et verrouillés pour garantir 1 seule couleur par nom.
   */
  private setupBrandLookup() {
    const nameControl = this.storeForm.get('name');
    if (!nameControl) {
      return;
    }

    nameControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(name => {
        const trimmed = (name || '').trim();
        if (trimmed.length < 2) {
          return of(null);
        }
        return this.storeService.getBrandByName(trimmed).pipe(catchError(() => of(null)));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(brand => this.applyBrand(brand));
  }

  private applyBrand(brand: StoreBrandDto | null) {
    if (brand) {
      this.storeForm.patchValue({
        textColor: brand.textColor,
        bgColor: brand.bgColor,
        useGradient: !!brand.gradientColor,
        gradientColor: brand.gradientColor ?? this.storeForm.controls.gradientColor.value,
      }, { emitEvent: false });
      COLOR_CONTROL_NAMES.forEach(name => this.storeForm.get(name)?.disable({ emitEvent: false }));
      this.brandLocked.set(true);
      this.lockedBrandName.set(brand.name);
    } else {
      COLOR_CONTROL_NAMES.forEach(name => this.storeForm.get(name)?.enable({ emitEvent: false }));
      this.brandLocked.set(false);
      this.lockedBrandName.set(null);
    }
  }

  badgePreviewBg(): string {
    const { bgColor, useGradient, gradientColor } = this.storeForm.getRawValue();
    if (useGradient && gradientColor) {
      return `linear-gradient(100deg, ${bgColor} 0%, ${bgColor} 55%, ${gradientColor} 100%)`;
    }
    return bgColor;
  }

  badgePreviewColor(): string {
    return this.storeForm.getRawValue().textColor;
  }

  badgePreviewName(): string {
    return this.storeForm.getRawValue().name?.trim() || 'Aperçu';
  }


  onClose() {
    this.dialogRef.close();
  }

}
