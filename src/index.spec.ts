import mongoose from 'mongoose';
import {Model, Schema, Types} from "mongoose";
import {DefaultMongooseOperations} from "./index";

//RUN MONGO INTO DOCKER #docker run --name mongo --restart=always -p 27017:27017 -d mongo
const url = 'mongodb://localhost:27017/test228'

describe('Testing DefaultMongooseOperations', () => {
    let mongoOperations: DefaultMongooseOperations;
    let model: Model<any>;
    beforeEach(async () => {
        await mongoose.connect(url, { useNewUrlParser: true });
        model = !!model ? model : mongoose.model('test228', new Schema({
                description: {type: Number, default: () => Math.random()},
                hiddenField: {type: Number, default: () => Math.random()}
            }))
        const count = await model.find({}).countDocuments();
        if (!count) {
            const notEmptyArray = Array.apply(null, {length: 10} as any).map(Number.call, Number);
            await model.insertMany(notEmptyArray.map(el => {}));
        }
        mongoOperations = new DefaultMongooseOperations(model);
    });

    describe('testing aggregateWithPagination', () => {
       it('should method return count', async () => {
           const {count} = await mongoOperations.aggregateWithPagination();
           expect(!!count).toBe(true)
       });

        it('should method return data with match', async () => {
            const {data} = await mongoOperations.aggregateWithPagination();
            const mongoId = (data as {_id: Types.ObjectId}[]).map(({_id}) => _id).find(el => el);
            expect(!!mongoId).toBe(true);
            const result = await mongoOperations.aggregateWithPagination({match: {_id: mongoId}});
            expect(result.count === 1).toBe(true)
        });

        it('should method return data with project', async () => {
            const {data, count} = await mongoOperations.aggregateWithPagination({project: {description: 1}});
            const hiddenPath = (data as {description: number; hiddenField?: number}[]).map(el => el.hiddenField).find(el => el);
            expect(hiddenPath === undefined && count === 10).toBe(true)
        });

        it('should method return count and limit works', async () => {
            const {count, data} = await mongoOperations.aggregateWithPagination({options: {limit: 1}});
            expect(count === 10 && data.length === 1).toBe(true)
        });

        it('should method return count and skip works', async () => {
            const result1 = await mongoOperations.aggregateWithPagination({options: {limit: 1}});
            const result2 = await mongoOperations.aggregateWithPagination({options: {limit: 1, skip: 1}});
            const id1 = (result1.data as {_id: Types.ObjectId}[]).map(({_id}) => _id).map(el => el.toString()).find(el => el);
            const id2 = (result2.data as {_id: Types.ObjectId}[]).map(({_id}) => _id).map(el => el.toString()).find(el => el);
            expect(id1 && id2 && id1 !== id2).toBe(true)
        });
    });
});
