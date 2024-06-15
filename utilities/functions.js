export const stringDateToTimestamp = stringDate => {
  return new Date(stringDate).getTime()
}