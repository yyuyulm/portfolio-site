import { useRef , useEffect} from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn, dependencies) => {
    const d3ref = useRef();

    useEffect(() => {
        renderChartFn(d3.select(d3ref.current));
        return () => {};
      }, dependencies);
    return d3ref;
}