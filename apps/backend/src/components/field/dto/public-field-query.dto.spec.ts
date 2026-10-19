import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PublicFieldQueryDto } from './public-field-query.dto';

describe('PublicFieldQueryDto', () => {
  it('transforms string page and limit to numbers with default values', async () => {
    const dto = plainToInstance(PublicFieldQueryDto, {
      page: '2',
      limit: '20',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
    expect(dto.sortBy).toBe('createdAt');
    expect(dto.sortOrder).toBe('DESC');
  });

  it('uses default page=1 and limit=10 when not provided', async () => {
    const dto = plainToInstance(PublicFieldQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('transforms requireDeposit values correctly (true, false, 1, 0, strings)', async () => {
    const dtoTrue = plainToInstance(PublicFieldQueryDto, {
      requireDeposit: 'true',
    });
    const errorsTrue = await validate(dtoTrue);
    expect(errorsTrue).toHaveLength(0);
    expect(dtoTrue.requireDeposit).toBe(true);

    const dtoFalse = plainToInstance(PublicFieldQueryDto, {
      requireDeposit: 'false',
    });
    const errorsFalse = await validate(dtoFalse);
    expect(errorsFalse).toHaveLength(0);
    expect(dtoFalse.requireDeposit).toBe(false);

    const dtoNum1 = plainToInstance(PublicFieldQueryDto, {
      requireDeposit: 1,
    });
    expect(dtoNum1.requireDeposit).toBe(true);

    const dtoNum0 = plainToInstance(PublicFieldQueryDto, {
      requireDeposit: 0,
    });
    expect(dtoNum0.requireDeposit).toBe(false);

    const dtoEmpty = plainToInstance(PublicFieldQueryDto, {
      requireDeposit: '',
    });
    const errorsEmpty = await validate(dtoEmpty);
    expect(errorsEmpty).toHaveLength(0);
    expect(dtoEmpty.requireDeposit).toBeUndefined();
  });

  it('trims search and district strings', async () => {
    const dto = plainToInstance(PublicFieldQueryDto, {
      search: '  Chảo Lửa  ',
      district: '  Tân Bình  ',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('Chảo Lửa');
    expect(dto.district).toBe('Tân Bình');
  });

  it('normalizes sortOrder to uppercase and validates sortBy enum', async () => {
    const dtoAsc = plainToInstance(PublicFieldQueryDto, {
      sortBy: 'name',
      sortOrder: 'asc',
    });
    const errorsAsc = await validate(dtoAsc);

    expect(errorsAsc).toHaveLength(0);
    expect(dtoAsc.sortBy).toBe('name');
    expect(dtoAsc.sortOrder).toBe('ASC');
  });

  it('fails validation on invalid values', async () => {
    const dtoInvalidPage = plainToInstance(PublicFieldQueryDto, {
      page: '0',
    });
    const errorsPage = await validate(dtoInvalidPage);
    expect(errorsPage.length).toBeGreaterThan(0);

    const dtoInvalidLimit = plainToInstance(PublicFieldQueryDto, {
      limit: '150',
    });
    const errorsLimit = await validate(dtoInvalidLimit);
    expect(errorsLimit.length).toBeGreaterThan(0);

    const dtoInvalidSortBy = plainToInstance(PublicFieldQueryDto, {
      sortBy: 'invalidColumn',
    });
    const errorsSortBy = await validate(dtoInvalidSortBy);
    expect(errorsSortBy.length).toBeGreaterThan(0);

    const dtoInvalidSortOrder = plainToInstance(PublicFieldQueryDto, {
      sortOrder: 'RANDOM',
    });
    const errorsSortOrder = await validate(dtoInvalidSortOrder);
    expect(errorsSortOrder.length).toBeGreaterThan(0);
  });
});
