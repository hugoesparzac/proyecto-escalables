import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="visible">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Datos de Pago</h2>
          <button class="close-button" (click)="cancel()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="cardNumber">Número de Tarjeta</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              [(ngModel)]="cardNumber"
              placeholder="4242 4242 4242 4242"
              maxlength="19"
              (input)="formatCardNumber()"
              [class.is-invalid]="cardNumberError"
            >
            <div class="error-message" *ngIf="cardNumberError">{{ cardNumberError }}</div>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label for="expiryDate">Fecha de Expiración</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                [(ngModel)]="expiryDate"
                placeholder="MM/AA"
                maxlength="5"
                (input)="formatExpiryDate()"
                [class.is-invalid]="expiryDateError"
              >
              <div class="error-message" *ngIf="expiryDateError">{{ expiryDateError }}</div>
            </div>

            <div class="form-group col">
              <label for="cvc">CVC</label>
              <input
                type="text"
                id="cvc"
                name="cvc"
                [(ngModel)]="cvc"
                placeholder="123"
                maxlength="4"
                [class.is-invalid]="cvcError"
              >
              <div class="error-message" *ngIf="cvcError">{{ cvcError }}</div>
            </div>
          </div>

          <div class="form-group">
            <label for="cardholderName">Nombre del Titular</label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              [(ngModel)]="cardholderName"
              placeholder="Como aparece en la tarjeta"
              [class.is-invalid]="nameError"
            >
            <div class="error-message" *ngIf="nameError">{{ nameError }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            (click)="cancel()"
          >
            Cancelar
          </button>
          <button
            class="btn btn-primary"
            (click)="submit()"
            [disabled]="isLoading"
          >
            <span *ngIf="!isLoading">Pagar</span>
            <span *ngIf="isLoading" class="spinner">
              <i class="fas fa-spinner fa-spin"></i> Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.4rem;
      color: #333;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #777;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-footer {
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .col {
      flex: 1;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #555;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }

    input.is-invalid {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 4px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background-color: #4a90e2;
      color: white;
    }

    .btn-primary:hover {
      background-color: #3a7bc8;
    }

    .btn-primary:disabled {
      background-color: #a0c4f0;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #f0f0f0;
      color: #333;
    }

    .btn-secondary:hover {
      background-color: #e0e0e0;
    }

    .spinner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class CreditCardFormComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() amount: number = 0;
  @Input() isLoading: boolean = false;

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  cardNumber: string = '';
  expiryDate: string = '';
  cvc: string = '';
  cardholderName: string = '';

  cardNumberError: string = '';
  expiryDateError: string = '';
  cvcError: string = '';
  nameError: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  formatCardNumber(): void {
    // Remove all non-digits
    let value = this.cardNumber.replace(/\D/g, '');

    // Add space every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || '';
    }

    this.cardNumber = value;
  }

  formatExpiryDate(): void {
    // Remove all non-digits
    let value = this.expiryDate.replace(/\D/g, '');

    // Format as MM/YY
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    this.expiryDate = value;
  }

  validateForm(): boolean {
    let isValid = true;

    // Validate card number
    const cardDigits = this.cardNumber.replace(/\D/g, '');
    if (!cardDigits || cardDigits.length < 16) {
      this.cardNumberError = 'Número de tarjeta inválido';
      isValid = false;
    } else {
      this.cardNumberError = '';
    }

    // Validate expiry date
    const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryPattern.test(this.expiryDate)) {
      this.expiryDateError = 'Fecha inválida';
      isValid = false;
    } else {
      const [month, year] = this.expiryDate.split('/');
      const expiry = new Date();
      expiry.setFullYear(2000 + parseInt(year, 10), parseInt(month, 10), 0);

      if (expiry < new Date()) {
        this.expiryDateError = 'Tarjeta vencida';
        isValid = false;
      } else {
        this.expiryDateError = '';
      }
    }

    // Validate CVC
    if (!this.cvc || this.cvc.length < 3) {
      this.cvcError = 'CVC inválido';
      isValid = false;
    } else {
      this.cvcError = '';
    }

    // Validate name
    if (!this.cardholderName || this.cardholderName.length < 3) {
      this.nameError = 'Nombre requerido';
      isValid = false;
    } else {
      this.nameError = '';
    }

    return isValid;
  }

  submit(): void {
    if (!this.validateForm()) {
      return;
    }

    const cardData = {
      cardNumber: this.cardNumber.replace(/\s/g, ''),
      expiryDate: this.expiryDate,
      cvc: this.cvc,
      cardholderName: this.cardholderName
    };

    this.onSubmit.emit(cardData);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
