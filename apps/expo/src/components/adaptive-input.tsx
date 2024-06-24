import type { Control } from "react-hook-form";
import type { SelectProps } from "tamagui";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
import { Controller } from "react-hook-form";
import { Input, Label, Paragraph, TextArea, Theme, YStack } from "tamagui";

import { Select } from "~/components/ui/select";

export interface InputType {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  values?: { label: string; value: string }[];
}

export function AdaptiveInput<FormType extends object>({
  input,
  control,
  selectProps,
}: {
  input: Omit<InputType, "schema">;
  control: Control<FormType, unknown>;
  selectProps?: SelectProps;
}) {
  return (
    <Controller
      key={input.id}
      control={control}
      name={input.id as never}
      render={({
        field: { onChange, onBlur, value, name, ref, disabled },
        fieldState: { error },
      }) => (
        <>
          <Theme name={error ? "red" : undefined}>
            <YStack>
              <Label>{input.label}</Label>
              {input.type === "select" && (
                <Select
                  onValueChange={onChange}
                  value={value}
                  name={name}
                  {...selectProps}
                >
                  <Select.Trigger iconAfter={ChevronDown}>
                    <Select.Value placeholder={input.placeholder} w="100%" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Viewport>
                      <Select.Group>
                        {input.values?.map((item, i) => {
                          return (
                            <Select.Item
                              index={i}
                              key={item.label}
                              value={item.value}
                            >
                              <Select.ItemText>{item.label}</Select.ItemText>
                              <Select.ItemIndicator marginLeft="auto">
                                <Check size={16} />
                              </Select.ItemIndicator>
                            </Select.Item>
                          );
                        })}
                      </Select.Group>
                    </Select.Viewport>
                  </Select.Content>
                </Select>
              )}
              {input.type === "text" && (
                <Input
                  placeholder={input.placeholder}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  ref={ref}
                  disabled={disabled}
                />
              )}
              {input.type === "textarea" && (
                <TextArea
                  placeholder={input.placeholder}
                  textAlignVertical="top"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  ref={ref}
                  disabled={disabled}
                />
              )}
              {error && <Paragraph>{error.message}</Paragraph>}
            </YStack>
          </Theme>
        </>
      )}
    />
  );
}
