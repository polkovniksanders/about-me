import type {
  FormState,
  FieldName,
  ValidationResult,
  ContactFormData,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from './types';

const SUBMIT_TIMEOUT_MS = 10_000;

// ─── Validators map ────────────────────────────────────────────────────────────
// Typed as Record<FieldName, ...> so TS catches missing/extra keys

const validators: Record<FieldName, (v: string) => ValidationResult> = {
  name:    (v) => v.trim().length >= 2 ? null : 'Имя должно содержать минимум 2 символа',
  phone:   (v) => /^[+\d\s()\-]{7,20}$/.test(v.trim()) ? null : 'Введите корректный номер телефона',
  email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Введите корректный email',
  comment: (v) => v.trim().length >= 10 ? null : 'Комментарий: минимум 10 символов',
};

export function validateField(name: FieldName, value: string): ValidationResult {
  return validators[name](value);
}

function validateAll(data: Pick<ContactFormData, FieldName>): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  (Object.keys(validators) as FieldName[]).forEach((key) => {
    const result = validators[key](data[key]);
    if (result !== null) errors[key] = result;
  });
  return errors;
}

// ─── Type guards ───────────────────────────────────────────────────────────────

function isApiSuccessResponse(val: unknown): val is ApiSuccessResponse {
  return typeof val === 'object' && val !== null
    && (val as Record<string, unknown>)['success'] === true;
}

function isApiErrorResponse(val: unknown): val is ApiErrorResponse {
  return typeof val === 'object' && val !== null
    && (val as Record<string, unknown>)['success'] === false;
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function postContactForm(data: ContactFormData): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const json: unknown = await response.json();

    if (!response.ok) {
      if (isApiErrorResponse(json)) return json;
      return { success: false, error: `Ошибка сервера (${response.status})` };
    }

    if (isApiSuccessResponse(json)) return json;
    return { success: false, error: 'Неожиданный ответ сервера' };

  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { success: false, error: 'Превышено время ожидания. Попробуйте ещё раз.' };
    }
    return { success: false, error: 'Сетевая ошибка. Проверьте соединение.' };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── DOM state machine ────────────────────────────────────────────────────────

function renderFormState(formEl: HTMLFormElement, state: FormState): void {
  formEl.dataset['state'] = state;

  const submitBtn = formEl.querySelector<HTMLButtonElement>('#submit-btn');
  if (submitBtn) {
    submitBtn.disabled = state === 'loading';
    submitBtn.classList.toggle('is-loading', state === 'loading');
  }
}

function showFieldError(fieldName: FieldName, message: string): void {
  const input = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
  const errorEl = document.getElementById(`error-${fieldName}`);

  input?.classList.add('is-invalid');
  input?.classList.remove('is-valid');

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
  }
}

function clearFieldError(fieldName: FieldName): void {
  const input = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
  const errorEl = document.getElementById(`error-${fieldName}`);

  input?.classList.remove('is-invalid');

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
  }
}

function markFieldValid(fieldName: FieldName): void {
  const input = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
  input?.classList.add('is-valid');
  input?.classList.remove('is-invalid');
}

// ─── Form initialization ──────────────────────────────────────────────────────

export function initForm(): void {
  const formEl = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!formEl) return;

  // Set timing field
  const loadTimeEl = document.getElementById('field-load-time') as HTMLInputElement | null;
  if (loadTimeEl) loadTimeEl.value = String(Date.now());

  // Per-field blur validation
  (Object.keys(validators) as FieldName[]).forEach((fieldName) => {
    const input = formEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${fieldName}"]`
    );
    if (!input) return;

    input.addEventListener('blur', () => {
      const error = validateField(fieldName, input.value);
      if (error) {
        showFieldError(fieldName, error);
      } else {
        clearFieldError(fieldName);
        markFieldValid(fieldName);
      }
    });

    // Clear error on input after error shown
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        const error = validateField(fieldName, input.value);
        if (!error) {
          clearFieldError(fieldName);
          markFieldValid(fieldName);
        }
      }
    });
  });

  // Submit handler
  formEl.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    // Validate all fields before submitting
    const fieldData: Pick<ContactFormData, FieldName> = {
      name:    (formEl.querySelector<HTMLInputElement>('[name="name"]')?.value ?? ''),
      phone:   (formEl.querySelector<HTMLInputElement>('[name="phone"]')?.value ?? ''),
      email:   (formEl.querySelector<HTMLInputElement>('[name="email"]')?.value ?? ''),
      comment: (formEl.querySelector<HTMLTextAreaElement>('[name="comment"]')?.value ?? ''),
    };

    const errors = validateAll(fieldData);
    if (Object.keys(errors).length > 0) {
      (Object.keys(errors) as FieldName[]).forEach((key) => {
        const msg = errors[key];
        if (msg) showFieldError(key, msg);
      });
      // Focus first invalid field
      const firstError = Object.keys(errors)[0] as FieldName | undefined;
      if (firstError) {
        formEl.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      }
      return;
    }

    const data: ContactFormData = {
      ...fieldData,
      honeypot: (formEl.querySelector<HTMLInputElement>('[name="website"]')?.value ?? ''),
      _formLoadTime: (document.getElementById('field-load-time') as HTMLInputElement | null)?.value ?? '0',
    };

    // Set loading state, then yield to browser to paint it before fetch
    renderFormState(formEl, 'loading');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const result = await postContactForm(data);

    if (result.success) {
      renderFormState(formEl, 'success');
    } else {
      renderFormState(formEl, 'error');
      // Show server-side field error if returned
      if (!result.success && result.field) {
        showFieldError(result.field, result.error);
      } else if (!result.success) {
        const errorTextEl = formEl.querySelector<HTMLElement>('.form__error-text');
        if (errorTextEl) errorTextEl.textContent = result.error;
      }
    }
  });
}
