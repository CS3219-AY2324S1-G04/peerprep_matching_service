/**
 * @file Scheduler that runs every one hour to sync up with questions-server
 * Based off Irving de Boer's Scheduler 
 */
import cron from 'cron'
import questionType from '../dataStructs/questionType';
import languageType from '../dataStructs/languageType';

export class questionServerSync {

    private _questionType;
    private _languageType;

    constructor() {
        this._questionType = new questionType();
        this._languageType = new languageType();
    }

    /**
     * Starts the scheduler to run update list every hour.
     */
    public start() {
        const job = new cron.CronJob('*/10 * * * *', async () => {
                console.log('Running scheduled job to sync with question-service');
                try {
                    await this._questionType.update();
                    await this._languageType.update();
                } catch (error) {
                    console.error('Error during the scheduled job:', error);
                }
            },
            null);

        job.start();
    }
}

