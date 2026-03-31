import { ref, type Ref } from 'vue';
import type { QForm } from 'quasar';

export function useFormValidation(): {
  formRef: Ref<QForm | null>;
  validate: () => Promise<boolean>;
} {
  const formRef = ref<QForm | null>(null);

  async function validate(): Promise<boolean> {
    if (!formRef.value?.validate) return false;
    return await formRef.value.validate();
  }

  return { formRef, validate };
}
