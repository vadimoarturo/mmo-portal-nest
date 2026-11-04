export const HelperService = {
  enumToOptions(enumObj: Record<string, string | number>) {
    return Object.keys(enumObj).map((key) => ({
      value: key,
      label: enumObj[key],
    }));
  },
};
