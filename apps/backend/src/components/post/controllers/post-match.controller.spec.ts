/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostMatchService } from '../services/post-match.service';
import { PostMatchController } from './post-match.controller';

describe('PostMatchController', () => {
  let controller: PostMatchController;
  let service: jest.Mocked<PostMatchService>;

  beforeEach(() => {
    service = {
      applyMatch: jest.fn(),
      getPostMatches: jest.fn(),
      acceptMatch: jest.fn(),
      rejectMatch: jest.fn(),
      cancelMatch: jest.fn(),
    } as unknown as jest.Mocked<PostMatchService>;

    controller = new PostMatchController(service);
  });

  it('delegates applyMatch to service', async () => {
    const match = { id: 'm-1' } as PostMatchEntity;
    service.applyMatch.mockResolvedValue(match);

    const result = await controller.applyMatch('p-1', 'u-1');
    expect(result).toEqual(match);
    expect(service.applyMatch).toHaveBeenCalledWith('p-1', 'u-1');
  });

  it('delegates getPostMatches to service', async () => {
    service.getPostMatches.mockResolvedValue([]);
    const result = await controller.getPostMatches('p-1', 'u-1');
    expect(result).toEqual([]);
    expect(service.getPostMatches).toHaveBeenCalledWith('p-1', 'u-1');
  });

  it('delegates acceptMatch to service', async () => {
    const match = { id: 'm-1', status: 'accepted' } as PostMatchEntity;
    service.acceptMatch.mockResolvedValue(match);

    const result = await controller.acceptMatch('p-1', 'm-1', 'host-1');
    expect(result).toEqual(match);
    expect(service.acceptMatch).toHaveBeenCalledWith('p-1', 'm-1', 'host-1');
  });

  it('delegates rejectMatch to service', async () => {
    const match = { id: 'm-1', status: 'rejected' } as PostMatchEntity;
    service.rejectMatch.mockResolvedValue(match);

    const result = await controller.rejectMatch('p-1', 'm-1', 'host-1');
    expect(result).toEqual(match);
    expect(service.rejectMatch).toHaveBeenCalledWith('p-1', 'm-1', 'host-1');
  });

  it('delegates cancelMatch to service', async () => {
    service.cancelMatch.mockResolvedValue();
    await controller.cancelMatch('p-1', 'u-1');
    expect(service.cancelMatch).toHaveBeenCalledWith('p-1', 'u-1');
  });
});
