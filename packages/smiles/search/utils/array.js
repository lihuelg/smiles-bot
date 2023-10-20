export const getChunksOf = (originalArray, sizePerChunk) => {
    const chunks = [];
    for (let i = 0; i < originalArray.length; i += sizePerChunk) {
        chunks.push(originalArray.slice(i, i + sizePerChunk));
    }
    return chunks;
};
