function cleanObject<T>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  // @ts-ignore
  Object.keys(obj).forEach((key) => {
    const typedKey = key as keyof T;
    if (obj[typedKey] !== undefined) {
      cleaned[typedKey] = obj[typedKey];
    }
  });
  return cleaned;
}

export default cleanObject;

// Example usage with a specific object type
interface MyObjectType {
  hello: string;
  optional?: string | undefined;
  anotherField: number;
}
