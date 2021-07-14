import { FileValueAccessorDirective } from "./file-value-accessor.directive";

describe("FileValueAccessorDirective", () => {
  it("should create an instance", () => {
    const directive = new FileValueAccessorDirective({ nativeElement: null });
    expect(directive).toBeTruthy();
  });
});
