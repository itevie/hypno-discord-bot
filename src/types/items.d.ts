interface Item {
    id: number,
    name: string,
    price: number,
    description: string | null,
    droppable: boolean,
}

interface Aquireditem {
    item_id: number,
    user_id: number,
    amount: number,
}