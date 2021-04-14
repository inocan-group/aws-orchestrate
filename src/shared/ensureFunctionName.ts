export function ensureFunctionName(name: string) {
  if (!/^[A-Z_a-z]/.test(name) || /[!"#&'()*,.:;?@^]/.test(name)) {
    const e = new Error(`the function name "${name}" is not valid`);
    e.name = "InvalidName";
    throw (e);
  }

  return name;
}
