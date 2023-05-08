import { registerDecorator, ValidationOptions } from 'class-validator';

export function isMobile(validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      name: 'isMobile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' &&
            value.startsWith('1') &&
            value.length == 11
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
        defaultMessage: (validationArguments) =>
          validationArguments!.property + ' is not the correct mobile number!',
      },
    });
  };
}
