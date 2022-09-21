const convertStringToBool = (value: string): boolean => {
  const valueInLowerCase = value.toLowerCase();

  const booleanMap = new Map([
    ['true', true],
    ['false', false],
  ]);

  if (!booleanMap.has(valueInLowerCase)) {
    throw new Error(
      `The string value can have only the following values: true, false`,
    );
  }

  return booleanMap.get(valueInLowerCase);
};

export default convertStringToBool;
