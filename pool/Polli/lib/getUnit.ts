import deA1Unit1 from "../data/de/A1/unit1.json";
import deA1Unit2 from "../data/de/A1/unit2.json";
import deA1Unit3 from "../data/de/A1/unit3.json";
import deA1Unit4 from "../data/de/A1/unit4.json";
import deA1Unit5 from "../data/de/A1/unit5.json";
import deA1Unit6 from "../data/de/A1/unit6.json";
import deA1Unit7 from "../data/de/A1/unit7.json";
import frA1Unit1 from "../data/fr/A1/unit1.json";
import frA1Unit2 from "../data/fr/A1/unit2.json";
import frA1Unit3 from "../data/fr/A1/unit3.json";
import frA1Unit4 from "../data/fr/A1/unit4.json";
import frA1Unit5 from "../data/fr/A1/unit5.json";
import frA1Unit6 from "../data/fr/A1/unit6.json";
import frA1Unit7 from "../data/fr/A1/unit7.json";

export type language = "de" | "fr";
export type level = "A1" | "A2" | "A3" | "B1" | "B2" | "C1" | "C2";
export type unit = number;

export type UnitContent = {
  language: language;
  level: level;
  unit: unit;
  title: string;
  description?: string;
  contents: any[];
};

export type UnitData = {
  [key: string]: {
    [key: string]: {
      [key: string]: UnitContent;
    };
  };
};

const dataRegistery: UnitData = {
  de: {
    A1: {
      1: deA1Unit1 as UnitContent,
      2: deA1Unit2 as UnitContent,
      3: deA1Unit3 as UnitContent,
      4: deA1Unit4 as UnitContent,
      5: deA1Unit5 as UnitContent,
      6: deA1Unit6 as UnitContent,
      7: deA1Unit7 as UnitContent,
    },
  },
  fr: {
    A1: {
      1: frA1Unit1 as UnitContent,
      2: frA1Unit2 as UnitContent,
      3: frA1Unit3 as UnitContent,
      4: frA1Unit4 as UnitContent,
      5: frA1Unit5 as UnitContent,
      6: frA1Unit6 as UnitContent,
      7: frA1Unit7 as UnitContent,
    },
  },
};

export const getUnit = (
  language: language,
  level: level,
  unit: unit,
): UnitContent | undefined => {
  return dataRegistery[language]?.[level]?.[unit.toString()];
};
