import { NextResponse } from "next/server";

const isRequired = (value: string | number | boolean, onError : () => void, options? : {
  fieldName?: string
}) => {

  if (value === null || value === undefined || value === "") {
    onError();
    return false;
  }
  return true;
};

export const serverValidation = {
  isRequired,
};
