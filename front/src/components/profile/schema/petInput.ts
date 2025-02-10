import { z } from "zod";

export const petInputSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  type: z.string().min(1, "種類を入力してください"),
  birthDay: z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;
      if (!/^\d{4}\/\d{2}\/\d{2}$/.test(val)) {
        return val;
      }
  
      // 🔹 年・月・日を分割
      const [year, month, day] = val.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        return "無効な生年月日です";
      }
      return val;
    },
    z
      .string()
      .regex(/^\d{4}\/\d{2}\/\d{2}$/, "生年月日は YYYY/MM/DD の形式で入力してください")
  )
});

export type PetInputData = z.infer<typeof petInputSchema>;
