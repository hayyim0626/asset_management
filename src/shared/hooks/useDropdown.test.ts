import { renderHook, act } from "@testing-library/react";
import { useDropdown } from "./useDropdown";

describe("useDropdown", () => {
  it("초기 상태가 false여야 함", () => {
    const { result } = renderHook(() => useDropdown({}));

    expect(result.current.isOpen).toBe(false);
  });

  it("handleToggle 호출 시 isOpen이 토글되어야 함", () => {
    const { result } = renderHook(() => useDropdown({}));

    expect(result.current.isOpen).toBe(false);

    act(() => result.current.handleToggle());

    expect(result.current.isOpen).toBe(true);

    act(() => result.current.handleToggle());

    expect(result.current.isOpen).toBe(false);
  });

  it("handleToggle 호출 시 onOpenChange 콜백이 호출되어야 함", () => {
    const onOpenChange = jest.fn();
    const { result } = renderHook(() => useDropdown({ onOpenChange }));

    act(() => result.current.handleToggle());

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    act(() => result.current.handleToggle());

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("handleClose 호출 시 onOpenChange 콜백이 false와 함께 호출되어야 함", () => {
    const onOpenChange = jest.fn();
    const { result } = renderHook(() => useDropdown({ onOpenChange }));

    act(() => result.current.handleToggle());
    onOpenChange.mockClear();

    act(() => result.current.handleClose());

    expect(result.current.isOpen).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("onOpenChange가 없을 때도 정상 작동해야 함", () => {
    const { result } = renderHook(() => useDropdown({}));

    expect(() => {
      act(() => result.current.handleToggle());
    }).not.toThrow();

    expect(() => {
      act(() => result.current.handleClose());
    }).not.toThrow();
  });
});
