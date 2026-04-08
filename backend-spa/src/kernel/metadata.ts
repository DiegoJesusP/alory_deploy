export class Metadata {
    total: number
    totalFiltered: number
    currentPage: number
    pageSize: number
    totalPages: number

    constructor(total: number, totalFiltered: number, currentPage: number, pageSize: number, totalPages: number) {
        this.total = total
        this.totalFiltered = totalFiltered
        this.currentPage = currentPage
        this.pageSize = pageSize
        this.totalPages = totalPages
    }
}
