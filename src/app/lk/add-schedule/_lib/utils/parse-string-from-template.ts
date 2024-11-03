export default function parseStringFromTemplate(template: string, input: string) {
    // получаем имена полей из шаблона (между фигурными скобками)
    const fieldNames = [...template.matchAll(/\{(\w+)\}/g)].map(match => match[1]);

    // создаем регулярное выражение для замены {field} на захватывающую группу
    const regexPattern = template.replace(/\{(\w+)\}/g, '(?<$1>.+?)');
    const regex = new RegExp(`^${regexPattern}$`);
    const match = input.match(regex);

    if (match && match.groups) {
        // формируем объект с полями из строки
        return fieldNames.reduce((acc, field) => {
            acc[field] = match.groups[field];
            return acc;
        }, {});
    } else {
        throw new Error("Input string does not match the template.");
    }
}