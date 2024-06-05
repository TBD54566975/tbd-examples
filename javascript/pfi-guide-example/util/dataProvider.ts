
class DataProvider {

    async insert(opts: {db: string, data: JSON}) {

    }

    async queryForMessage(opts: {db: string, exchangeId: string, messageKind: string}) {

    }

    async queryForOffering(opts: {db: string, offeringId: string}) {

    }

    async getOfferings(opts: {db: string}) {
        
    }
}

export const dataProvider = new DataProvider();