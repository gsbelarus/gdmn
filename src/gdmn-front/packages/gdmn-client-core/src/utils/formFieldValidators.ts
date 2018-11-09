import { Validator } from 'redux-form';

const emailValidator: Validator = (value: string) =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? 'Invalid email address' : undefined;

const passwordValidator: Validator = (value: string) =>
  value && !!getMinLengthValidator(4)(value) ? `Invalid password: ${getMinLengthValidator(4)(value)}` : undefined;

const requireValidator: Validator = (value: any) => (value ? undefined : 'Required');

const numberValidator: Validator = (value: any) => (value && isNaN(Number(value)) ? 'Must be a number' : undefined);

const getMaxLengthValidator = (max: number): Validator => (value: string) =>
  value && value.length > max ? `Must be ${max} characters or less` : undefined;

const getMinLengthValidator = (min: number): Validator => (value: string) =>
  value && value.length < min ? `Must be at least ${min} characters` : undefined;

const getMinValueValidator = (min: number): Validator => (value: number) =>
  value && value < min ? `Must be at least ${min}` : undefined;

// TODO throw ValidationError

export {
  emailValidator,
  passwordValidator,
  requireValidator,
  numberValidator,
  getMaxLengthValidator,
  getMinLengthValidator,
  getMinValueValidator
};
