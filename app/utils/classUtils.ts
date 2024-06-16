export async function generateUniqueCode(): Promise<string> {
    const codeLength = 6;
    const characters = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}