import { addLocaleData } from "react-intl";
import zh from "react-intl/locale-data/zh";
import en from "react-intl/locale-data/en";
import fr from "react-intl/locale-data/fr";

export function registerLang(){
  addLocaleData([...zh,...en,...fr]);
}