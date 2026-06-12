import { generateId } from '../generate-id.util';

describe('generateId()', () => {
  it('trả về chuỗi có độ dài đúng yêu cầu', () => {
    expect(generateId('HD', 11)).toHaveLength(11);
    expect(generateId('DN', 12)).toHaveLength(12);
    expect(generateId('TH', 11)).toHaveLength(11);
    expect(generateId('HDP', 23)).toHaveLength(23);
  });

  it('bắt đầu bằng prefix viết hoa', () => {
    expect(generateId('hd', 11).startsWith('HD')).toBe(true);
  });

  it('cắt prefix nếu prefix dài hơn hoặc bằng length', () => {
    expect(generateId('HOPDONG', 5)).toBe('HOPDO');
  });

  it('sinh ra các ID khác nhau giữa các lần gọi', () => {
    const id1 = generateId('HDP', 23);
    const id2 = generateId('HDP', 23);
    expect(id1).not.toBe(id2);
  });
});
